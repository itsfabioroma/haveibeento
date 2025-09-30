import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
	try {
		const supabase = await getSupabaseClient();

		const { data, error } = await supabase
			.from('visited_countries')
			.select('*')
			.order('visited_date', { ascending: false });

		if (error) {
			console.error('Error fetching visited countries:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ countries: data });
	} catch (error: any) {
		console.error('Error in GET /api/countries:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Check if bulk sync request
		if (body.countries && Array.isArray(body.countries)) {
			// Bulk insert for syncing localStorage data
			const supabase = await getSupabaseClient();
			const insertData = body.countries.map((c: any) => ({
				country_code: c.country_code,
				country_name: c.country_name,
				notes: c.notes || null,
			}));

			// Use upsert to handle duplicates gracefully
			const { data, error } = await supabase
				.from('visited_countries')
				.upsert(insertData, {
					onConflict: 'user_id,country_code',
					ignoreDuplicates: true,
				})
				.select();

			if (error) {
				console.error('Error bulk inserting countries:', error);
				return NextResponse.json({ error: error.message }, { status: 500 });
			}

			return NextResponse.json({
				success: true,
				synced: data?.length || 0,
			}, { status: 201 });
		}

		// Single country insert (original behavior)
		const { country_code, country_name, notes } = body;

		if (!country_code || !country_name) {
			return NextResponse.json(
				{ error: 'country_code and country_name are required' },
				{ status: 400 }
			);
		}

		const supabase = await getSupabaseClient();

		const { data, error } = await supabase
			.from('visited_countries')
			.insert([{
				country_code,
				country_name,
				notes: notes || null,
			}])
			.select()
			.single();

		if (error) {
			// Handle unique constraint violation (country already visited)
			if (error.code === '23505') {
				return NextResponse.json(
					{ error: 'Country already marked as visited' },
					{ status: 409 }
				);
			}
			console.error('Error inserting visited country:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ country: data }, { status: 201 });
	} catch (error: any) {
		console.error('Error in POST /api/countries:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const country_code = searchParams.get('country_code');

		if (!country_code) {
			return NextResponse.json(
				{ error: 'country_code is required' },
				{ status: 400 }
			);
		}

		const supabase = await getSupabaseClient();

		const { error } = await supabase
			.from('visited_countries')
			.delete()
			.eq('country_code', country_code);

		if (error) {
			console.error('Error deleting visited country:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error in DELETE /api/countries:', error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}